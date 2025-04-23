// Calendar Application Class
class CalendarApp {
    constructor() {
      this.events = [];
      this.currentDate = new Date();
      this.selectedDate = new Date();
      this.currentView = 'month';
      this.loadEvents();
      this.initEventListeners();
      this.render();
    }
  
    initEventListeners() {
      // Theme toggle
      document.getElementById('theme-toggle').addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.target.checked);
        localStorage.setItem('darkMode', e.target.checked);
      });
  
      // Load theme preference
      const darkMode = localStorage.getItem('darkMode') === 'true';
      document.getElementById('theme-toggle').checked = darkMode;
      document.body.classList.toggle('dark-theme', darkMode);
  
      // Calendar navigation
      document.getElementById('prev-btn').addEventListener('click', () => this.navigate('prev'));
      document.getElementById('next-btn').addEventListener('click', () => this.navigate('next'));
      document.getElementById('today-btn').addEventListener('click', () => this.goToToday());
  
      // View selection
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.changeView(e.target.dataset.view);
        });
      });
  
      // Add event button
      document.getElementById('add-event-btn').addEventListener('click', () => {
        this.openEventModal();
      });
  
      // Close modal
      document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('event-modal').classList.remove('active');
      });
  
      // Submit event form
      document.getElementById('event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEvent();
      });
  
      // Delete event button
      document.getElementById('delete-event-btn').addEventListener('click', () => {
        this.deleteEvent(document.getElementById('event-id').value);
      });
  
      // Search events
      document.getElementById('search-events').addEventListener('input', (e) => {
        this.searchEvents(e.target.value);
      });
    }
  
    loadEvents() {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        this.events = JSON.parse(savedEvents).map(event => {
          return {
            ...event,
            date: new Date(event.date)
          };
        });
      }
    }
  
    saveEvents() {
      localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    }
  
    addEvent(event) {
      // Generate unique ID
      event.id = Date.now().toString();
      this.events.push(event);
      this.saveEvents();
      this.render();
    }
  
    updateEvent(updatedEvent) {
      const index = this.events.findIndex(event => event.id === updatedEvent.id);
      if (index !== -1) {
        this.events[index] = updatedEvent;
        this.saveEvents();
        this.render();
      }
    }
  
    deleteEvent(eventId) {
      this.events = this.events.filter(event => event.id !== eventId);
      this.saveEvents();
      document.getElementById('event-modal').classList.remove('active');
      this.render();
    }
  
    getEventsForDate(date) {
      return this.events.filter(event => 
        date.getDate() === event.date.getDate() && 
        date.getMonth() === event.date.getMonth() && 
        date.getFullYear() === event.date.getFullYear()
      );
    }
  
    getEventsForWeek(startDate) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      return this.events.filter(event => {
        return event.date >= startDate && event.date <= endDate;
      });
    }
  
    searchEvents(query) {
      if (!query) {
        this.render();
        return;
      }
      
      query = query.toLowerCase();
      const filteredEvents = this.events.filter(event => 
        event.title.toLowerCase().includes(query) || 
        (event.description && event.description.toLowerCase().includes(query))
      );
      
      // Highlight matched events in the calendar
      this.renderEvents(filteredEvents);
      
      // Update the detailed view if it's visible
      if (document.getElementById('detailed-day').style.display !== 'none') {
        this.renderDetailedDay(true, filteredEvents);
      }
    }
  
    renderEvents(filteredEvents = null) {
      // Clear all event highlights first
      document.querySelectorAll('.event-item').forEach(item => {
        item.style.opacity = '1';
      });
      
      if (!filteredEvents) return;
      
      // If we have filtered events, highlight only those
      document.querySelectorAll('.event-item').forEach(item => {
        const eventId = item.dataset.eventId;
        const isInFilter = filteredEvents.some(event => event.id === eventId);
        item.style.opacity = isInFilter ? '1' : '0.3';
      });
    }
  
    navigate(direction) {
      switch (this.currentView) {
        case 'month':
          this.currentDate.setMonth(this.currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
          break;
        case 'week':
          this.currentDate.setDate(this.currentDate.getDate() + (direction === 'prev' ? -7 : 7));
          break;
        case 'day':
          this.currentDate.setDate(this.currentDate.getDate() + (direction === 'prev' ? -1 : 1));
          this.selectedDate = new Date(this.currentDate);
          break;
      }
      this.render();
    }
  
    goToToday() {
      this.currentDate = new Date();
      this.selectedDate = new Date();
      this.render();
    }
  
    changeView(view) {
      this.currentView = view;
      this.render();
    }
  
    selectDate(date) {
      this.selectedDate = date;
      this.renderDetailedDay();
      
      // If in day view, also update current date
      if (this.currentView === 'day') {
        this.currentDate = new Date(date);
        this.renderCalendar();
      }
    }
  
    openEventModal(event = null) {
      const modal = document.getElementById('event-modal');
      const form = document.getElementById('event-form');
      const modalTitle = document.getElementById('modal-title');
      const deleteBtn = document.getElementById('delete-event-btn');
      
      form.reset();
      
      if (event) {
        modalTitle.textContent = 'Edit Event';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-time').value = event.time || '';
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-color').value = event.color || '#4a6fa5';
        
        // Format the date for the input
        const eventDate = new Date(event.date);
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        document.getElementById('event-date').value = formattedDate;
        deleteBtn.style.display = 'block';
      } else {
        modalTitle.textContent = 'Add Event';
        document.getElementById('event-id').value = '';
        
        // Format the selected date for the input
        const year = this.selectedDate.getFullYear();
        const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        document.getElementById('event-date').value = formattedDate;
        deleteBtn.style.display = 'none';
      }
      
      modal.classList.add('active');
    }
  
    saveEvent() {
      const form = document.getElementById('event-form');
      const eventId = document.getElementById('event-id').value;
      const eventDateStr = document.getElementById('event-date').value;
      const eventDate = new Date(eventDateStr);
      
      const eventData = {
        title: document.getElementById('event-title').value,
        time: document.getElementById('event-time').value,
        description: document.getElementById('event-description').value,
        color: document.getElementById('event-color').value,
        date: eventDate
      };
      
      if (eventId) {
        // Update existing event
        eventData.id = eventId;
        this.updateEvent(eventData);
      } else {
        // Add new event
        this.addEvent(eventData);
      }
      
      document.getElementById('event-modal').classList.remove('active');
    }
  
    render() {
      this.renderCalendar();
      this.renderDetailedDay();
    }
  
    renderCalendar() {
      const calendarView = document.getElementById('calendar-view');
      calendarView.innerHTML = '';
      
      // Update header
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonthText = monthNames[this.currentDate.getMonth()] + ' ' + this.currentDate.getFullYear();
      document.getElementById('current-month').textContent = currentMonthText;
  
      // Set calendar view class
      calendarView.className = this.currentView + '-view';
      
      switch (this.currentView) {
        case 'month':
          this.renderMonthView(calendarView);
          break;
        case 'week':
          this.renderWeekView(calendarView);
          break;
        case 'day':
          this.renderDayView(calendarView);
          break;
      }
    }
  
    renderMonthView(container) {
      // Day names header
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday-header';
        dayHeader.textContent = day;
        container.appendChild(dayHeader);
      });
      
      // Get first day of month and number of days in month
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
      
      // Get previous month's last days
      const prevMonth = new Date(year, month, 0);
      const prevMonthLastDate = prevMonth.getDate();
      
      // Fill in previous month's days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'day inactive';
        day.innerHTML = `<div class="day-number">${prevMonthLastDate - i}</div>`;
        
        const prevDate = new Date(year, month - 1, prevMonthLastDate - i);
        const dayEvents = this.getEventsForDate(prevDate);
        this.renderDayEvents(day, dayEvents);
        
        day.addEventListener('click', () => {
          const clickDate = new Date(year, month - 1, prevMonthLastDate - i);
          this.selectDate(clickDate);
        });
        
        container.appendChild(day);
      }
      
      // Fill in current month's days
      const today = new Date();
      for (let i = 1; i <= lastDate; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        
        // Check if day is today
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
          day.classList.add('today');
        }
        
        // Check if day is selected
        if (year === this.selectedDate.getFullYear() && 
            month === this.selectedDate.getMonth() && 
            i === this.selectedDate.getDate()) {
          day.classList.add('selected');
        }
        
        day.innerHTML = `<div class="day-number">${i}</div>`;
        
        const currentDate = new Date(year, month, i);
        const dayEvents = this.getEventsForDate(currentDate);
        this.renderDayEvents(day, dayEvents);
        
        day.addEventListener('click', () => {
          const clickDate = new Date(year, month, i);
          this.selectDate(clickDate);
          
          // Remove selected class from all days
          document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
          day.classList.add('selected');
        });
        
        container.appendChild(day);
      }
      
      // Fill in next month's days
      const daysFromNextMonth = 42 - (firstDay + lastDate);
      for (let i = 1; i <= daysFromNextMonth; i++) {
        const day = document.createElement('div');
        day.className = 'day inactive';
        day.innerHTML = `<div class="day-number">${i}</div>`;
        
        const nextDate = new Date(year, month + 1, i);
        const dayEvents = this.getEventsForDate(nextDate);
        this.renderDayEvents(day, dayEvents);
        
        day.addEventListener('click', () => {
          const clickDate = new Date(year, month + 1, i);
          this.selectDate(clickDate);
        });
        
        container.appendChild(day);
      }
    }
  
    renderWeekView(container) {
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(this.currentDate);
      startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
      
      // Day names header
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayNames.forEach((day, index) => {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + index);
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday-header';
        dayHeader.textContent = `${day} ${currentDay.getDate()}/${currentDay.getMonth() + 1}`;
        container.appendChild(dayHeader);
      });
      
      // Create week days
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        
        const day = document.createElement('div');
        day.className = 'day';
        
        // Check if day is today
        if (currentDay.getDate() === today.getDate() && 
            currentDay.getMonth() === today.getMonth() && 
            currentDay.getFullYear() === today.getFullYear()) {
          day.classList.add('today');
        }
        
        // Check if day is selected
        if (currentDay.getDate() === this.selectedDate.getDate() && 
            currentDay.getMonth() === this.selectedDate.getMonth() && 
            currentDay.getFullYear() === this.selectedDate.getFullYear()) {
          day.classList.add('selected');
        }
        
        const dayEvents = this.getEventsForDate(currentDay);
        this.renderDayEvents(day, dayEvents);
        
        day.addEventListener('click', () => {
          this.selectDate(new Date(currentDay));
          
          // Remove selected class from all days
          document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
          day.classList.add('selected');
        });
        
        container.appendChild(day);
      }
    }
  
    renderDayView(container) {
      // Create 24 hour slots
      for (let hour = 0; hour < 24; hour++) {
        const hourDiv = document.createElement('div');
        hourDiv.className = 'daily-hour';
        
        const hourLabel = document.createElement('div');
        hourLabel.className = 'hour-label';
        hourLabel.textContent = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        
        const hourEvents = document.createElement('div');
        hourEvents.className = 'hour-events';
        
        // Filter events for this hour
        const dayEvents = this.getEventsForDate(this.currentDate).filter(event => {
          if (!event.time) return false;
          const eventHour = parseInt(event.time.split(':')[0]);
          return eventHour === hour;
        });
        
        // Add events to hour slot
        dayEvents.forEach(event => {
          const eventItem = document.createElement('div');
          eventItem.className = 'event-item';
          eventItem.dataset.eventId = event.id;
          eventItem.style.borderLeftColor = event.color || '#4a6fa5';
          eventItem.textContent = `${event.time ? event.time : ''} ${event.title}`;
          
          eventItem.addEventListener('click', () => {
            this.openEventModal(event);
          });
          
          hourEvents.appendChild(eventItem);
        });
        
        hourDiv.appendChild(hourLabel);
        hourDiv.appendChild(hourEvents);
        container.appendChild(hourDiv);
      }
    }
  
    renderDayEvents(dayContainer, events) {
      if (!events || events.length === 0) return;
      
      const eventList = document.createElement('div');
      eventList.className = 'event-list';
      
      events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.dataset.eventId = event.id;
        eventItem.style.borderLeftColor = event.color || '#4a6fa5';
        eventItem.textContent = event.title;
        
        eventItem.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEventModal(event);
        });
        
        eventList.appendChild(eventItem);
      });
      
      dayContainer.appendChild(eventList);
    }
  
    renderDetailedDay(isSearch = false, filteredEvents = null) {
      const detailedDay = document.getElementById('detailed-day');
      const detailedEvents = document.getElementById('detailed-events');
      
      // Format date for display
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = this.selectedDate.toLocaleDateString('en-US', options);
      document.getElementById('selected-date').textContent = formattedDate;
      
      // Show detailed view
      detailedDay.style.display = 'block';
      
      // Clear previous events
      detailedEvents.innerHTML = '';
      
      // Get events for selected date
      let events = isSearch && filteredEvents 
        ? filteredEvents.filter(event => 
            event.date.getDate() === this.selectedDate.getDate() && 
            event.date.getMonth() === this.selectedDate.getMonth() && 
            event.date.getFullYear() === this.selectedDate.getFullYear())
        : this.getEventsForDate(this.selectedDate);
      
      // Sort events by time
      events = events.sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
      
      // Display events
      if (events.length === 0) {
        detailedEvents.innerHTML = '<p>No events for this day.</p>';
        return;
      }
      
      events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'detailed-event-item';
        eventItem.style.borderLeftColor = event.color || '#4a6fa5';
        
        const eventTitle = document.createElement('h4');
        eventTitle.textContent = event.title;
        
        const eventTime = document.createElement('p');
        eventTime.textContent = event.time ? `Time: ${event.time}` : 'All Day';
        
        const eventDesc = document.createElement('p');
        eventDesc.textContent = event.description || 'No description';
        
        const eventActions = document.createElement('div');
        eventActions.className = 'event-actions';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
          this.openEventModal(event);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.backgroundColor = '#d9534f';
        deleteBtn.addEventListener('click', () => {
          this.deleteEvent(event.id);
        });
        
        eventActions.appendChild(editBtn);
        eventActions.appendChild(deleteBtn);
        
        eventItem.appendChild(eventTitle);
        eventItem.appendChild(eventTime);
        eventItem.appendChild(eventDesc);
        eventItem.appendChild(eventActions);
        
        detailedEvents.appendChild(eventItem);
      });
    }
  }
  
  // Initialize the calendar application
  document.addEventListener('DOMContentLoaded', () => {
    const calendarApp = new CalendarApp();
  });