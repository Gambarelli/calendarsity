import React, { useState } from "react";
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, setHours, compareAsc }  from "date-fns";
import Drawer from 'react-drag-drawer'
import "./calendar.css";
// import "../../node_modules/react-datepicker/dist/react-datepicker.min.css"
import "../../node_modules/@blueprintjs/core/lib/css/blueprint.css"
import "../../node_modules/@blueprintjs/datetime/lib/css/blueprint-datetime.css"
import { Divider, EditableText, Button } from '@blueprintjs/core';
import { TimePicker, DatePicker, DateInput } from '@blueprintjs/datetime';
import { CirclePicker } from 'react-color';
// import DatePicker from "react-datepicker";
 
const Calendar = () => {
  
  const [reminders, setReminders] = useState([
      {
          title: 'Click here for instructions',
          description: 'Hey! there arent really lots of instructions. Click a cell to add a reminder. Click a reminder to edit it or delete it. Thanks blueprintJS for the awesome these components',
          date: new Date(),
          color: 'blue',
          time: setHours(new Date(), 12),
          city: 'San Pedro Sula',
          id: 1
      }
  ]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toggle, setToggle ] = useState(false);
  const [newReminder, setNewReminder] = useState({
        title: '',
        description: '',
        date: new Date(),
        color: 'blue',
        time: setHours(new Date(), 12),
        city: 'San Pedro Sula',
        id: 2
  });
  const [selectedReminder, setSelectedReminder] = useState();
  const [editReminder, setEditReminder] = useState(false);

  const header = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <div className="header row flex-middle">
        <div className="column col-start">
          <div className="icon" onClick={prevMonth}>
            chevron_left
          </div>
        </div>
        <div className="column col-center">
          <span>{format(currentDate, dateFormat)}</span>
        </div>
        <div className="column col-end">
          <div className="icon" onClick={nextMonth}>
            chevron_right
          </div>
        </div>
      </div>
    );
  };

  const days = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="column col-center" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="days row" style={{backgroundColor: '#2E74B5', color: 'white'}}>{days}</div>;
  };

  const cells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const remindersForCurrentDay = reminders.filter((reminder) => isSameDay(day, reminder.date ));
        remindersForCurrentDay.sort((a, b) => compareAsc(a.time,b.time));
        days.push(
          <div
            className={`column cell ${
              !isSameMonth(day, monthStart)
                ? "disabled"
                : isSameDay(day, selectedDate)
                ? "selected"
                : ""
            }`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            { remindersForCurrentDay ? remindersForCurrentDay.map((reminder)=>(
              <div className="reminder" onClick={() => onEditReminderClick(reminder)} style={{borderLeft: '4px solid ' + reminder.color}}>{reminder.title + ' at ' + format(reminder.time,'h a')}</div>
            )) : null}  
            <span className="number">{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {" "}
          {days}{" "}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onDateClick = day => {
    setSelectedDate(day);
    setToggle(!toggle);
    setNewReminder({...newReminder, date: day});
  };

  const onCreateReminderClick = () => {
    setReminders([...reminders, {...newReminder, id: ++reminders.length}]);
    setToggle(!toggle);
  }

  const onDeleteReminderClick = (id) => {
    setReminders(reminders.filter( reminder => reminder.id !== id ))
    setToggle(!toggle);
    setEditReminder(false);
  }

  const onConfirmEditReminder = (id) => {
    setReminders(reminders.map( reminder =>  reminder.id === id ? selectedReminder : reminder ));
    setToggle(!toggle);
    setEditReminder(false);
  }

  const onEditReminderClick = (reminder) => {
    setEditReminder(true);
    setSelectedReminder(reminder);
  }

  const onHandleCloseToggle = () => {
    setToggle(!toggle);
    setEditReminder(false);
  }

  return (
    <div className="calendar">
      <div>{header()}</div>
      <div>{days()}</div>
      <div>{cells()}</div>
      <Drawer open={toggle} onRequestClose={onHandleCloseToggle} modalElementClass="modal">
          { !editReminder ? <div style={{ padding: 32, borderTop: '8px solid' + newReminder.color ,borderRadius: '8px'}}>
             <h2 className="bp3-heading">
                    <EditableText
                        maxLength={30}
                        placeholder="Add a title..."
                        onConfirm={(title) => setNewReminder({...newReminder, title: title})}
                    />
             </h2>
                <EditableText
                    maxLength={50}
                    maxLines={12}
                    minLines={3}
                    multiline={true}
                    placeholder="Add a description..."
                    onConfirm={(description) => setNewReminder({...newReminder, description: description})}
                />
                <Divider/>
                 <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                     <h2 className="bp3-heading">Which date?</h2>
                     <div style={{display: 'flex',flexDirection: 'row',width: '37%',justifyContent: 'flex-end'}}>
                     <DateInput
                        parseDate={str => new Date(str)}
                        formatDate={date => date}
                        onChange={(date) => setNewReminder({...newReminder, date: date})}
                        placeholder={"M/D/YYYY"}
                        defaultValue={selectedDate}
                    />
                     </div>
                </div>
                 <Divider/>
                 <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                     <h2 className="bp3-heading">At what time?</h2>
                     <div style={{display: 'flex',flexDirection: 'row',width: '30%',justifyContent: 'flex-end'}}>
                         <TimePicker 
                         showArrowButtons={true}
                         useAmPm={true}
                         defaultValue={newReminder.time}
                         onChange={(time) => setNewReminder({...newReminder, time: time})}
                         />
                     </div>
                </div>
                <Divider/>
                 <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                     <h2 className="bp3-heading">Which City?</h2>                     
                     <h3 className="bp3-heading" style={{marginLeft: '12%'}}>
                        <EditableText
                            maxLength={30}
                            placeholder="London..."
                            onConfirm={(city) => setNewReminder({...newReminder, city: city})}
                        />
                     </h3>
                </div>
                <Divider/>
                 <div>
                     <h2 className="bp3-heading">Choose your color</h2>                     
                     <CirclePicker
                        style={{margin: '0 auto'}}
                        color={newReminder.color}
                        onChangeComplete={ (color) => setNewReminder({...newReminder, color: color.hex}) }
                    />
                </div>
                <div style={{display: 'flex',flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Button onClick={onCreateReminderClick} icon="plus"> Create reminder </Button>
                </div>
          </div>
       : <div style={{ padding: 32, borderTop: '8px solid' + newReminder.color ,borderRadius: '8px'}}>
       <h2 className="bp3-heading">
              <EditableText
                  maxLength={30}
                  placeholder="Add a title..."
                  defaultValue={selectedReminder.title}
                  onConfirm={(title) => setSelectedReminder({...selectedReminder, title: title})}
              />
       </h2>
          <EditableText
              maxLength={50}
              maxLines={12}
              minLines={3}
              multiline={true}
              placeholder="Add a description..."
              defaultValue={selectedReminder.description}
              onConfirm={(description) => setSelectedReminder({...selectedReminder, description: description})}
          />
          <Divider/>
           <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
               <h2 className="bp3-heading">Which date?</h2>
               <div style={{display: 'flex',flexDirection: 'row',width: '37%',justifyContent: 'flex-end'}}>
               <DateInput
                  parseDate={str => new Date(str)}
                  formatDate={date => date}
                  onChange={(date) => setSelectedReminder({...selectedReminder, date: date})}
                  placeholder={"M/D/YYYY"}
                  defaultValue={selectedReminder.date}
              />
               </div>
          </div>
           <Divider/>
           <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
               <h2 className="bp3-heading">At what time?</h2>
               <div style={{display: 'flex',flexDirection: 'row',width: '30%',justifyContent: 'flex-end'}}>
                   <TimePicker 
                   showArrowButtons={true}
                   useAmPm={true}
                   defaultValue={selectedReminder.time}
                   onChange={(time) => setSelectedReminder({...selectedReminder, time: time})}
                   />
               </div>
          </div>
          <Divider/>
           <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
               <h2 className="bp3-heading">Which City?</h2>                     
               <h3 className="bp3-heading" style={{marginLeft: '12%'}}>
                  <EditableText
                      maxLength={30}
                      placeholder="London..."
                      defaultValue={selectedReminder.city}
                      onConfirm={(city) => setSelectedReminder({...selectedReminder, city: city})}
                  />
               </h3>
          </div>
          <Divider/>
           <div>
               <h2 className="bp3-heading">Choose your color</h2>                     
               <CirclePicker
                  style={{margin: '0 auto'}}
                  color={selectedReminder.color}
                  onChangeComplete={ (color) => setSelectedReminder({...selectedReminder, color: color.hex}) }
              />
          </div>
          <div style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button intent="Danger" onClick={() => onDeleteReminderClick(selectedReminder.id)} icon="trash"> Delete reminder </Button>
              <Button  onClick={() => onConfirmEditReminder(selectedReminder.id)} icon="edit"> Edit reminder </Button>
          </div>
    </div> }
      </Drawer>
    </div>
  );
};

export default Calendar;
