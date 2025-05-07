import { createApp, ref, computed } from 'vue';

createApp({
    setup() {
        // Timer state
        const elapsedTime = ref(0);
        const isRunning = ref(false);
        const timerInterval = ref(null);
        const newTask = ref('');
        const timeEntries = ref([]);
        
        // Load entries from localStorage if available
        if (localStorage.getItem('timeEntries')) {
            timeEntries.value = JSON.parse(localStorage.getItem('timeEntries'));
        }
        
        // Format the timer display
        const formattedTime = computed(() => {
            const hours = Math.floor(elapsedTime.value / 3600);
            const minutes = Math.floor((elapsedTime.value % 3600) / 60);
            const seconds = elapsedTime.value % 60;
            
            return [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':');
        });
        
        // Start or stop the timer
        function startStop() {
            if (isRunning.value) {
                // Stop the timer
                clearInterval(timerInterval.value);
                isRunning.value = false;
            } else {
                // Start the timer
                isRunning.value = true;
                timerInterval.value = setInterval(() => {
                    elapsedTime.value++;
                }, 1000);
            }
        }
        
        // Reset the timer
        function reset() {
            if (!isRunning.value) {
                elapsedTime.value = 0;
                newTask.value = '';
            }
        }
        
        // Check if entry can be added
        const canAddEntry = computed(() => {
            return newTask.value.trim() !== '' && elapsedTime.value > 0;
        });
        
        // Add a new time entry
        function addEntry() {
            if (!canAddEntry.value) return;
            
            timeEntries.value.unshift({
                task: newTask.value,
                duration: elapsedTime.value,
                date: new Date()
            });
            
            // Save to localStorage
            saveEntries();
            
            // Reset timer and task
            elapsedTime.value = 0;
            newTask.value = '';
        }
        
        // Delete an entry
        function deleteEntry(index) {
            timeEntries.value.splice(index, 1);
            saveEntries();
        }
        
        // Save entries to localStorage
        function saveEntries() {
            localStorage.setItem('timeEntries', JSON.stringify(timeEntries.value));
        }
        
        // Format duration for display
        function formatDuration(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            
            let result = '';
            if (hours > 0) {
                result += `${hours}h `;
            }
            if (minutes > 0 || hours > 0) {
                result += `${minutes}m `;
            }
            result += `${remainingSeconds}s`;
            
            return result;
        }
        
        // Format date for display
        function formatDate(date) {
            return new Date(date).toLocaleString();
        }
        
        // Calculate total time tracked
        const totalSeconds = computed(() => {
            return timeEntries.value.reduce((total, entry) => total + entry.duration, 0);
        });
        
        const totalTimeFormatted = computed(() => {
            const hours = Math.floor(totalSeconds.value / 3600);
            const minutes = Math.floor((totalSeconds.value % 3600) / 60);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else {
                return `${minutes}m`;
            }
        });
        
        return {
            elapsedTime,
            isRunning,
            newTask,
            timeEntries,
            formattedTime,
            canAddEntry,
            totalTimeFormatted,
            startStop,
            reset,
            addEntry,
            deleteEntry,
            formatDuration,
            formatDate
        };
    }
}).mount('#app');

