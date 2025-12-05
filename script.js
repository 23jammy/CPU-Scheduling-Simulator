$(document).ready(function () {

    const MAX_PROCESSES = 20; // System Limit
    let processCount = 0;
    const colors = [
        'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400',
        'bg-lime-400', 'bg-green-400', 'bg-emerald-400', 'bg-teal-400',
        'bg-cyan-400', 'bg-sky-400', 'bg-blue-400', 'bg-indigo-400',
        'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400', 'bg-rose-400'
    ];

    // Initialize with 3 rows
    addProcessRow(0, 5, 1);
    addProcessRow(0, 4, 2);
    addProcessRow(0, 3, 3);

    // --- Event Listeners ---

    $('#add-process-btn').click(function () {
        if (processCount >= MAX_PROCESSES) {
            alert(`System Limit Reached: You cannot add more than ${MAX_PROCESSES} processes.`);
            return;
        }
        addProcessRow();
    });

    $('#input-table-body').on('click', '.delete-btn', function () {
        if ($('#input-table-body tr').length > 1) {
            $(this).closest('tr').remove();
            updateProcessLabels();
        } else {
            alert("At least one process is required.");
        }
    });

    $('#algorithm-select').change(function () {
        const algo = $(this).val();
        if (algo.includes('Priority')) {
            $('.priority-col').removeClass('hidden');
        } else {
            $('.priority-col').addClass('hidden');
        }
    });

    $('#reset-btn').click(function () {
        resetTable();
    });

    $('#run-simulation-btn').click(function () {
        runSimulation();
    });

    // CSV Upload Logic
    $('#csv-input').change(function (e) {
        const file = e.target.files[0];
        const $errorBox = $('#file-error-message');
        $errorBox.addClass('hidden').text('');

        if (!file) return;

        // Validate Extension
        if (!file.name.endsWith('.csv')) {
            $errorBox.text("Error: Please upload a valid .csv file.").removeClass('hidden');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target.result;
            const rows = text.split('\n');

            const newProcesses = [];
            let hasError = false;
            let errorLine = 0;

            for (let i = 0; i < rows.length; i++) {
                const line = rows[i].trim();
                if (line === '') continue; // Skip empty lines

                const cols = line.split(',');

                // Check column count (Arrival, Burst, Priority)
                if (cols.length < 2) { // Allow 2 if priority is missing/optional, but ideally 3
                    hasError = true;
                    errorLine = i + 1;
                    $errorBox.text(`Error on Line ${errorLine}: Missing columns. Format: Arrival, Burst, Priority`).removeClass('hidden');
                    break;
                }

                const at = parseInt(cols[0]);
                const bt = parseInt(cols[1]);
                const prio = cols[2] ? parseInt(cols[2]) : 1; // Default priority 1 if missing

                // Validate Values
                if (isNaN(at) || at < 0 || isNaN(bt) || bt <= 0 || isNaN(prio)) {
                    hasError = true;
                    errorLine = i + 1;
                    $errorBox.text(`Error on Line ${errorLine}: Invalid numbers. Burst must be > 0, Arrival >= 0.`).removeClass('hidden');
                    break;
                }

                newProcesses.push({ at, bt, prio });
            }

            if (!hasError) {
                if (newProcesses.length > MAX_PROCESSES) {
                    $errorBox.text(`Error: File contains ${newProcesses.length} processes. System limit is ${MAX_PROCESSES}.`).removeClass('hidden');
                    return;
                }

                if (newProcesses.length > 0) {
                    // Clear existing table and populate
                    $('#input-table-body').empty();
                    processCount = 0;
                    newProcesses.forEach(p => {
                        addProcessRow(p.at, p.bt, p.prio);
                    });

                    // Clear file input so same file can be selected again if needed
                    $('#csv-input').val('');
                    $('#results-section').addClass('hidden');
                }
            }
        };

        reader.onerror = function () {
            $errorBox.text("Error reading file.").removeClass('hidden');
        };

        reader.readAsText(file);
    });


    // --- Helper Functions ---

    function resetTable() {
        $('#input-table-body').empty();
        processCount = 0;
        addProcessRow(0, 5, 1);
        addProcessRow(0, 4, 2);
        addProcessRow(0, 3, 3);
        $('#results-section').addClass('hidden');
        $('#error-message').addClass('hidden');
        $('#file-error-message').addClass('hidden');
        $('#csv-input').val('');
    }

    function addProcessRow(at = 0, bt = 5, prio = 1) {
        processCount++;
        const isPriority = $('#algorithm-select').val().includes('Priority');
        const newRow = `
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4 md:px-6 text-center font-bold text-theme-dark process-id">P${processCount}</td>
                        <td class="py-3 px-4 md:px-6 text-center">
                            <input type="number" min="0" value="${at}" class="arrival-input w-16 md:w-20 text-center border border-gray-300 rounded py-1 focus:ring-2 focus:ring-[#0d1b2a] outline-none transition">
                        </td>
                        <td class="py-3 px-4 md:px-6 text-center">
                            <input type="number" min="1" value="${bt}" class="burst-input w-16 md:w-20 text-center border border-gray-300 rounded py-1 focus:ring-2 focus:ring-[#0d1b2a] outline-none transition">
                        </td>
                        <td class="py-3 px-4 md:px-6 text-center priority-col ${isPriority ? '' : 'hidden'}">
                            <input type="number" min="0" value="${prio}" class="priority-input w-16 md:w-20 text-center border border-gray-300 rounded py-1 focus:ring-2 focus:ring-[#0d1b2a] outline-none transition">
                        </td>
                        <td class="py-3 px-4 md:px-6 text-center">
                            <button class="delete-btn text-red-400 hover:text-red-600 transition p-2">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
        $('#input-table-body').append(newRow);
        updateProcessLabels();
    }

    function updateProcessLabels() {
        $('#input-table-body tr').each(function (index) {
            $(this).find('.process-id').text(`P${index + 1}`);
        });
        processCount = $('#input-table-body tr').length;
    }

    function getProcessColor(index) {
        return colors[index % colors.length];
    }


    // --- Simulation Logic ---

    function runSimulation() {
        const processes = [];
        let hasError = false;

        $('#input-table-body tr').each(function (index) {
            const at = parseInt($(this).find('.arrival-input').val());
            const bt = parseInt($(this).find('.burst-input').val());
            const prio = parseInt($(this).find('.priority-input').val());

            if (isNaN(at) || at < 0 || isNaN(bt) || bt <= 0) {
                hasError = true;
                return false;
            }

            processes.push({
                id: `P${index + 1}`,
                at: at,
                bt: bt,
                prio: isNaN(prio) ? 0 : prio,
                color: getProcessColor(index),
                originalBt: bt,
                isCompleted: false
            });
        });

        if (hasError) {
            $('#error-message').text("Please enter valid positive numbers. Burst time must be > 0.").removeClass('hidden');
            return;
        }
        $('#error-message').addClass('hidden');

        const algorithm = $('#algorithm-select').val();
        let timeline = [];
        let results = [];

        if (algorithm === 'FCFS') {
            timeline = runFCFS(processes);
        } else if (algorithm === 'SJF') {
            timeline = runSJF(processes);
        } else if (algorithm === 'Priority') {
            timeline = runPriority(processes);
        } else if (algorithm === 'PriorityPreemptive') {
            timeline = runPriorityPreemptive(processes);
        }

        processes.forEach(p => {
            results.push({
                id: p.id,
                at: p.at,
                bt: p.originalBt,
                prio: p.prio,
                ct: 0, tat: 0, wt: 0, rt: 0
            });
        });

        timeline.forEach(block => {
            if (block.id !== 'IDLE') {
                const p = results.find(r => r.id === block.id);
                if (block.end > p.ct) {
                    p.ct = block.end;
                }
            }
        });

        // --- Post-Simulation Metrics & Rendering ---
        // ADDED: totalRT initialized to 0
        let totalTAT = 0, totalWT = 0, totalRT = 0, totalBurst = 0, maxFinishTime = 0;

        results.forEach(p => {
            // TAT = Completion Time - Arrival Time
            p.tat = p.ct - p.at;
            // WT = Turnaround Time - Burst Time
            p.wt = p.tat - p.bt;

            // Response Time = First time CPU was allocated - Arrival Time
            const firstBlock = timeline.find(t => t.id === p.id);
            p.rt = firstBlock ? (firstBlock.start - p.at) : 0;

            // Accumulate totals for averages later
            totalTAT += p.tat;
            totalWT += p.wt;
            totalRT += p.rt; 
            totalBurst += p.bt;

            // Track the moment the very last process finished
            if (p.ct > maxFinishTime) maxFinishTime = p.ct;
        });

        // Render visuals based on calculated data
        renderGanttChart(timeline, maxFinishTime);
        renderTable(results, algorithm);

        // Update UI with calculated averages and CPU utilization
        $('#avg-tat').text((totalTAT / processes.length).toFixed(2) + " ms");
        $('#avg-wt').text((totalWT / processes.length).toFixed(2) + " ms");

        // ADDED: Logic to display Average Response Time (Requires an HTML element with id="avg-rt")
        $('#avg-rt').text((totalRT / processes.length).toFixed(2) + " ms");

        const util = ((totalBurst / maxFinishTime) * 100).toFixed(2);
        $('#cpu-util').text(isNaN(util) ? "0%" : util + "%");

        $('#results-section').removeClass('hidden');
        $('html, body').animate({
            scrollTop: $("#results-section").offset().top
        }, 800);
    }

    // --- Algorithms ---

    // First-Come, First-Served (FCFS)
    function runFCFS(processes) {
        // Sort processes by arrival time
        let sorted = [...processes].sort((a, b) => a.at - b.at);
        let currentTime = 0;
        let timeline = [];

        sorted.forEach(p => {
            // Check for CPU idle time
            if (currentTime < p.at) {
                timeline.push({ id: 'IDLE', start: currentTime, end: p.at });
                currentTime = p.at;
            }
            // Execute process fully
            timeline.push({
                id: p.id,
                start: currentTime,
                end: currentTime + p.bt,
                color: p.color
            });
            currentTime += p.bt;
        });
        return timeline;
    }

    // Shortest Job First (SJF) - Non-Preemptive
    function runSJF(processes) {
        let n = processes.length;
        let completed = 0;
        let currentTime = 0;
        let timeline = [];
        let procList = processes.map(p => ({ ...p })); // Clone to track completion

        while (completed < n) {
            // Find processes that have arrived and are not done
            let available = procList.filter(p => p.at <= currentTime && !p.isCompleted);

            if (available.length === 0) {
                // No process available: Jump to next arrival time (IDLE)
                let upcoming = procList.filter(p => !p.isCompleted).sort((a, b) => a.at - b.at);
                if (upcoming.length > 0) {
                    let nextTime = upcoming[0].at;
                    timeline.push({ id: 'IDLE', start: currentTime, end: nextTime });
                    currentTime = nextTime;
                } else {
                    break;
                }
            } else {
                // Sort by Burst Time (ascending), tie-break with Arrival Time
                available.sort((a, b) => {
                    if (a.bt === b.bt) return a.at - b.at;
                    return a.bt - b.bt;
                });

                // Execute selected process fully
                let p = available[0];
                timeline.push({ id: p.id, start: currentTime, end: currentTime + p.bt, color: p.color });
                currentTime += p.bt;
                p.isCompleted = true;
                completed++;
            }
        }
        return timeline;
    }

    // Priority Scheduling - Non-Preemptive
    function runPriority(processes) {
        let n = processes.length;
        let completed = 0;
        let currentTime = 0;
        let timeline = [];
        let procList = processes.map(p => ({ ...p }));

        while (completed < n) {
            // Find processes that have arrived
            let available = procList.filter(p => p.at <= currentTime && !p.isCompleted);

            if (available.length === 0) {
                // IDLE handling: jump to next arrival
                let upcoming = procList.filter(p => !p.isCompleted).sort((a, b) => a.at - b.at);
                if (upcoming.length > 0) {
                    let nextTime = upcoming[0].at;
                    timeline.push({ id: 'IDLE', start: currentTime, end: nextTime });
                    currentTime = nextTime;
                } else {
                    break;
                }
            } else {
                // Sort by Priority (ascending), tie-break with Arrival Time
                available.sort((a, b) => {
                    if (a.prio === b.prio) return a.at - b.at;
                    return a.prio - b.prio;
                });

                // Execute selected process fully
                let p = available[0];
                timeline.push({ id: p.id, start: currentTime, end: currentTime + p.bt, color: p.color });
                currentTime += p.bt;
                p.isCompleted = true;
                completed++;
            }
        }
        return timeline;
    }

    // Priority Scheduling - Preemptive
    function runPriorityPreemptive(processes) {
        let n = processes.length;
        let currentTime = 0;
        let completed = 0;
        let timeline = [];
        // Clone processes and add remaining burst time tracker
        let procList = processes.map(p => ({ ...p, remainingBt: p.bt }));
        let currentBlock = null;

        while (completed < n) {
            // Get available processes with remaining work
            let available = procList.filter(p => p.at <= currentTime && p.remainingBt > 0);

            if (available.length === 0) {
                // Handle IDLE: Close current block if active, start IDLE if needed
                if (currentBlock && currentBlock.id !== 'IDLE') {
                    timeline.push({ ...currentBlock, end: currentTime });
                    currentBlock = null;
                }
                if (!currentBlock) {
                    currentBlock = { id: 'IDLE', start: currentTime, color: '' };
                }
                currentTime++;
                continue;
            }

            // Sort by Priority (ascending)
            available.sort((a, b) => {
                if (a.prio === b.prio) return a.at - b.at;
                return a.prio - b.prio;
            });

            let p = available[0];

            // Context Switch: If a new process has higher priority, push the previous block
            if (currentBlock && currentBlock.id !== p.id) {
                timeline.push({ ...currentBlock, end: currentTime });
                currentBlock = null;
            }

            // Start new block if none exists
            if (!currentBlock) {
                currentBlock = { id: p.id, start: currentTime, color: p.color };
            }

            // Execute for 1 time unit
            p.remainingBt--;
            currentTime++;

            if (p.remainingBt === 0) {
                completed++;
            }
        }
        // Push the final remaining block
        if (currentBlock) {
            timeline.push({ ...currentBlock, end: currentTime });
        }
        return timeline;
    }

    // --- Visualization ---

    function renderGanttChart(timeline, totalTime) {
        const $chart = $('#gantt-chart');
        const $ruler = $('#time-ruler');
        $chart.empty();
        $ruler.empty();

        $ruler.append('<span class="absolute text-xs text-gray-500 font-bold mt-1" style="left: 0; transform: translateX(-50%);">0</span>');

        let cumulativePercent = 0;
        let animationDelay = 0;

        timeline.forEach((block) => {
            const duration = block.end - block.start;
            const percent = (duration / totalTime) * 100;

            const $bar = $('<div>', {
                class: 'gantt-bar h-full flex items-center justify-center text-white font-bold text-sm shadow-sm relative border-r border-white/20',
                css: { width: '0%' },
                title: `Process: ${block.id} \nStart: ${block.start} \nEnd: ${block.end}`
            });

            if (block.id === 'IDLE') {
                $bar.addClass('bg-gray-300 text-gray-600');
                $bar.html('<span class="text-xs italic">Idle</span>');
            } else {
                $bar.addClass(block.color);
                $bar.text(block.id);
            }

            $chart.append($bar);
            $bar.delay(animationDelay).animate({ width: percent + '%' }, 600, 'linear');

            cumulativePercent += percent;

            const $label = $('<span>', {
                class: 'absolute text-xs text-gray-600 font-bold transform -translate-x-1/2 mt-1',
                text: block.end,
                css: { left: cumulativePercent + '%' }
            });

            $label.hide();
            $ruler.append($label);

            setTimeout(() => {
                $label.fadeIn(200);
            }, animationDelay + 600);

            animationDelay += 600;
        });
    }

    function renderTable(results, algo) {
        const $tbody = $('#result-table-body');
        $tbody.empty();

        if (algo.includes('Priority')) {
            $('.priority-col-result').removeClass('hidden');
        } else {
            $('.priority-col-result').addClass('hidden');
        }

        results.forEach(p => {
            const row = `
                        <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td class="py-3 px-4 font-bold text-theme-dark">${p.id}</td>
                            <td class="py-3 px-4">${p.at}</td>
                            <td class="py-3 px-4">${p.bt}</td>
                            <td class="py-3 px-4 priority-col-result ${algo.includes('Priority') ? '' : 'hidden'}">${p.prio}</td>
                            <td class="py-3 px-4 text-center text-theme-dark font-bold">${p.ct}</td>
                            <td class="py-3 px-4 text-center">${p.tat}</td>
                            <td class="py-3 px-4 text-center">${p.wt}</td>
                            <td class="py-3 px-4 text-center">${p.rt}</td> <!-- ADDED: RT Column -->
                        </tr>
                    `;
            $tbody.append(row);
        });
    }
});