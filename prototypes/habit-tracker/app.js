// Habit Tracker App
class HabitTracker {
    constructor() {
        this.today = this.getTodayKey();
        this.allHabits = this.loadAllHabits(); // Master list of all habits
        this.todayHabits = this.loadTodayHabits(); // Today's completion status
        this.checkForNewDay();
        this.init();
        this.setupMidnightReset();
    }

    getTodayKey() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    checkForNewDay() {
        const lastDate = localStorage.getItem('lastDate');
        if (lastDate !== this.today) {
            // It's a new day - initialize today's habits from master list
            this.initializeTodayHabits();
            localStorage.setItem('lastDate', this.today);
        }
    }

    initializeTodayHabits() {
        // Create today's habit list from master list, all unchecked
        this.todayHabits = this.allHabits.map(habit => ({
            id: habit.id,
            name: habit.name,
            checked: false
        }));
        this.saveTodayHabits();
    }

    setupMidnightReset() {
        // Calculate milliseconds until midnight
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = midnight - now;

        // Set timeout to reset at midnight
        setTimeout(() => {
            this.resetForNewDay();
            // Then set up interval to check every minute (in case page stays open)
            setInterval(() => this.checkAndResetIfNewDay(), 60000);
        }, msUntilMidnight);
    }

    checkAndResetIfNewDay() {
        const currentDate = this.getTodayKey();
        if (currentDate !== this.today) {
            this.resetForNewDay();
        }
    }

    resetForNewDay() {
        this.today = this.getTodayKey();
        this.todayHabits = this.loadTodayHabits();
        this.checkForNewDay();
        this.updateDateDisplay();
        this.render();
    }

    init() {
        const addBtn = document.getElementById('addHabitBtn');
        const input = document.getElementById('habitInput');

        addBtn.addEventListener('click', () => this.addHabit());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addHabit();
            }
        });

        this.updateDateDisplay();
        this.render();
    }

    updateDateDisplay() {
        const dateDisplay = document.getElementById('dateDisplay');
        dateDisplay.textContent = this.formatDate(this.today);
    }

    addHabit() {
        const input = document.getElementById('habitInput');
        const habitName = input.value.trim();

        if (habitName === '') {
            alert('Please enter a habit name');
            return;
        }

        // Check if habit already exists
        if (this.allHabits.some(h => h.name.toLowerCase() === habitName.toLowerCase())) {
            alert('This habit already exists!');
            input.value = '';
            return;
        }

        const habit = {
            id: Date.now(),
            name: habitName,
            createdAt: new Date().toISOString()
        };

        // Add to master list
        this.allHabits.push(habit);
        this.saveAllHabits();

        // Add to today's list (unchecked)
        this.todayHabits.push({
            id: habit.id,
            name: habit.name,
            checked: false
        });
        this.saveTodayHabits();

        this.render();
        input.value = '';
    }

    toggleHabit(id) {
        const habit = this.todayHabits.find(h => h.id === id);
        if (habit) {
            habit.checked = !habit.checked;
            this.saveTodayHabits();
            this.render();
        }
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit? This will remove it from all days.')) {
            // Remove from master list
            this.allHabits = this.allHabits.filter(h => h.id !== id);
            this.saveAllHabits();

            // Remove from today's list
            this.todayHabits = this.todayHabits.filter(h => h.id !== id);
            this.saveTodayHabits();

            this.render();
        }
    }

    render() {
        const list = document.getElementById('habitsList');
        
        if (this.todayHabits.length === 0) {
            list.innerHTML = '<div class="empty-state">No habits yet. Add one to get started!</div>';
            return;
        }

        list.innerHTML = this.todayHabits.map(habit => `
            <div class="habit-item">
                <input 
                    type="checkbox" 
                    class="habit-checkbox" 
                    ${habit.checked ? 'checked' : ''}
                    onchange="tracker.toggleHabit(${habit.id})"
                />
                <span class="habit-name">${this.escapeHtml(habit.name)}</span>
                <button class="delete-btn" onclick="tracker.deleteHabit(${habit.id})">Delete</button>
            </div>
        `).join('');
    }

    saveAllHabits() {
        localStorage.setItem('allHabits', JSON.stringify(this.allHabits));
    }

    loadAllHabits() {
        const saved = localStorage.getItem('allHabits');
        return saved ? JSON.parse(saved) : [];
    }

    saveTodayHabits() {
        localStorage.setItem(`habits_${this.today}`, JSON.stringify(this.todayHabits));
    }

    loadTodayHabits() {
        // If today's habits don't exist, initialize from master list
        const saved = localStorage.getItem(`habits_${this.today}`);
        if (saved) {
            return JSON.parse(saved);
        } else {
            // Initialize from master list
            return this.allHabits.map(habit => ({
                id: habit.id,
                name: habit.name,
                checked: false
            }));
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const tracker = new HabitTracker();

