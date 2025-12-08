# Shifu Dai Lee's Datatypes Ching

Shifu Dai Lee has seen through meditative insight (and me through struggling with a MVP in Python) that there is an exact number of dataclasses required for this project. They are:

- date

- phase

- agenda entry
  
  - appointment
  
  - plan
  
  - anchor

- planning request entry
  
  - habit
  
  - task

- note
  
  - journal entry
  
  - chatbot note
  
  - daily, weekly, monthly and quarterly insight

### Date

*Times are precarious objects, many places use different formats, we will use a vector of time out of 24:00, date in USA format, and timezone in deviation from Greenwhich.*

Date = (HH:MM;

  YYYY-MM-DD;

  +timezone

)

### Phase

*The Wu Xing phases of the day are zones that typically suit types of acts. The machine will first judge tasks to categorise and then score based on appriopriate scheduling based on appropriateness / proximity. Just as the anchors their dates have to be computed daily for they depend on solar times.*

Phase = (name: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';

  startTime: Date;

  endTime: Date;

  color: string[];

  romanHours: number[];

  qualities: string;

  idealTasks: string[]

)

```
WOOD: {
    color: '#4A7C59',
    romanHours: [21, 22, 23, 0, 1],
    qualities: 'Growth, Planning, Vitality. Spiritual centering & movement.',
    idealTasks: ['spiritual', 'planning', 'movement'],
  },
  FIRE: {
    color: '#E63946',
    romanHours: [2, 3, 4, 5, 6],
    qualities: 'Peak energy, expression. Deep work & execution.',
    idealTasks: ['deep_work', 'creative', 'difficult'],
  },
  EARTH: {
    color: '#C49551',
    romanHours: [7, 8],
    qualities: 'Stability, nourishment. Lunch & restoration.',
    idealTasks: ['rest', 'integration', 'light_tasks'],
  },
  METAL: {
    color: '#A8AAAD',
    romanHours: [9, 10, 11, 12],
    qualities: 'Precision, organization. Admin & review.',
    idealTasks: ['admin', 'planning', 'study'],
  },
  WATER: {
    color: '#457B9D',
    romanHours: [13, 14, 15, 16, 17, 18, 19, 20],
    qualities: 'Rest, consolidation. Wind-down & recovery.',
    idealTasks: ['rest', 'reflection', 'recovery']
```

## Parent Class: Predetermined Events

Two type of objects get in the way of the blocking task of the model calendar events and spiritual disciplines. Because their dates are non-negotiable they are restraints for the model and not puzzle parts.

### Calendar Items

*For the far future not a lot of generated data is needed: habits and tasks may well be planned the night before. However, the fixed events of the future are the immovable mountains that firstly fill the Agenda.  Calendar items are those appointments the user has manually inputted in-app or imported through API integrated calendar services. Because they should not be removed when the Agenda is reset, they require their own database.*

Appointment = (name: string;

  startTime: Date;

  endTime: Date;

  description: string

)

### Scheduled Items

*At 8PM the scheduler model is activated and turns tasks and habits into scheduled items. They have value even after the fact, because their execution is value data affirming the model. They generate a history which is the second Agenda database.*

Plan = (name: string;

  startTime: Date;

  endTime: Date;

  id: string;

  done?: Boolean

)

### Anchors

*Anchors are certainly to repeat if user settings are not tweaked. They come from the universal database of spiritual disciplines which follows below. In the real world they are just like Appointments:*

Anchor= (name: string;

  startTime: Date;

  endTime: Date;

  description: string

)

*But where they come from they are stored with their Roman starting hour, and a duration. These are converted as follows: 1. Find location. 2. Get times of dawn and dusk. 3. Let light until dark be 12 segments: hours 13-24 from dusk at dawn. (Unequal day and night, Roman clock.) 4. Convert from Roman hour to Date to obtain startTime. 5. startTime + duration = endTime.*

```
Christianity - Major Prayers

Uur 0, Lauds - Morning Prayer (20min)
Uur 12, Vespers - Evening Prayer (20min)
Uur 15, Compline - Night Prayer (10min)

Christianity - Office of Readings  

Uur 21, Vigils - Office of Readings (1h)

Christianity - Minor Prayers 

Uur 3, Terce (10min)
Uur 6, Sext (10min)
Uur 9, None (10min)

---

Islam - Core Salah (Obligatory)

Uur 0, Fajr (10min)
Uur 6, Dhuhr (20min)
Uur 10, Asr (20min)
Uur 12, Maghrib (15min)
Uur 14, Isha (20min)

Islam - Complete Salah

Uur 21 Tahajjud (30min)
Uur 2, Duha (15min)
Uur 15, Witr (5min)

---

Judaism - Core Prayers

Uur 0, Shacharit (45min) 
Uur 9, Mincha (20min)
Uur 12, Ma'ariv / Arvit (20min)

Judaism - Blessings

Uur 21, Modeh Ani (5min)
Uur 6, Birkat Hamazon (10min) 
Uur 15, Kriat Shema al Hamita (5min)

---

Hinduism - Sandhyavandanam

Uur 0, Pratah Sandhya (30min)
Uur 6, Madhyahna Sandhya (30min)
Uur 12, Sayam Sandhya (30min)

Hinduism - Brahma Murta

Uur 21, Brahma Muhurta (3h)

Hinduism - Puja

Uur 3, Morning Puja (30min) 
Uur 9, Midday Aarti (10min) 
Uur 15, Evening Aarti (10min)

---

Buddhism - Layman's Practice

Uur 0, Mindfulness practice (15min)
Uur 12, 'Just sitting' (30min)
Uur 15, Metta practice (10min)

Buddhism - Kyoto Zen

Uur 21, Early Meditation (45h)
Uur 4, Morning Meditation (25min)
Uur 8, Afternoon Meditation (25min)

Buddhism - Shaolin Kung Fu

Uur 1, Chi Gong practice (1h)
Uur 5, Kung Fu - conditioning (1h)
Uur 9, Kung Fu - martial arts (1h)

---

Shinto - Daily Rituals

Uur 0, Greeting the Sun/Purification (10min) 
Uur 6, Offering to Kami (10min) 
Uur 12, Appreciation Ritual (15min)

Shinto - Cleansing Practices

Uur 21, Salt Cleansing (5min) 
Uur 3, Ancestor Veneration (10min)

Shinto - Meditation

Uur 9, Speaking to Spirits (10min) 
Uur 15, Evening Winddown (10min)

---

Sikhism - Nitnem (Daily Prayers)

Uur 0, Jap Ji Sahib - Morning Prayer (20min) 
Uur 12, Rehraas Sahib - Evening Prayer (20min) 
Uur 15, Kirtan Sohila - Bedtime Prayer (10min)

Sikhism - Amrit Vela

Uur 21, Amrit Vela - Early Morning Meditation (1h)

Sikhism - Additional Banis

Uur 3, Jaap Sahib (15min) 
Uur 6, Tav-Prasad Savaiye (10min) 
Uur 9, Chaupai Sahib (10min)

---

Wicca - Daily Devotions

Uur 0, Morning Gratitude Prayer (10min) 
Uur 6, Midday Meditation (15min) 
Uur 12, Evening Ritual (20min)

Wicca - Protection Rituals
Uur 21, Bedtime Protection (5min) 
Uur 3, Elemental Invocation (10min)

Wicca - Esbat Practices

Uur 9, Daily Spellwork (10min) 
Uur 15, Ancestor Honoring (10min)

---

Secular - Three Daily Meals

Uur 1, Breakfast (20min)
Uur 7, Lunch (20min)
Uur 11, Dinner (30min)

Secular - Notetaking

Uur 0, Planning (10min)
Uur 13, Reflection (15min)

Secular - Wake up before dawn

Uur 23, Wake up (30min)

Secular - Sunset winddown

Uur 12, WInddown (90min)
```

*Would be cute if all of next weeks anchors where scheduled on Saturday night. I think they should just always be scheduled regardless of conflict with appointments. Those two in union, they make the restraints that create variation in the optimisation problem of task & habit.*

## Parent Class: Dai Lee Scheduled

*Easiest algorithms fill the Agenda in layers:*

- *block out sleep*

- *block out work*

- *block out appointments*

- *block out anchors*

- *fill vacant timeslots with tasks*

- *fit habits in the last nicks of time remaining*

*The algorithm always has a hand of cards it can play in the case of vacant time. It rates its choices based on appropriateness to Wu Xing, finetuned on past success. Appropriateness is defined as probability the plan will be executed once it has been created as a Plan in the Agenda*

### Habits

*Habits are stored in a database that is future oriented. Tracking and statistics are achieved through queries from the historic Agenda and not this timeless database. All habits are user-generated, and Shifu warns them not to enter too many new habits at once, and may perhaps suggest adding more when things are going well. In the Habits menu there should be a feature to toggle keywords to more easily match phases.*

Habit = (id: string;

    title: string;

    minimum_duration: int;                            *The minimum number of minutes for a session, in minutes.*

    selected_days: Dict{ day: Boolean for day in week};

    effort_goal: int;                                           *The amount of time user wants to spend on habit per week, in minutes.*

    ideal_phase: Phase;

for key in keywords:

    is_key?: Boolean

)

### Tasks

*Tasks are done once and they're finished. They come from in-app entries or APIs from task management services. They have a deadline unless they do not in which case they are chores. Dai Lee should get maximally 10 tasks of urgence and 5 chores per day, more than can be planned but not all of them. Tasks can be standalone or be a subtask in a project, in which case they recieve their deadline from the project. Tasks in projects typically need to be done in sequence so grouped subtasks have a position in this order.*

Task = (id: string;

    title: string;

    effort_min: int;

    deadline: Optional[Date] = None;

    project_id: Optional[string] = None;

    project_title: Optional[string] = None;

    notes: Optional[string] = None;

    position_in_project: Optional[int];

*Because tasks have expected effort minutes the time required per day can be computed which is a good indicator to sort their urgence by. At withdrawal from the database the following are computed and added as extra variables, where the minimum and maximum are only employed if the task is a project member:*

    t_until_deadline := min( deadline, project.deadline) - today;                                                                         *In days*

    t_per_day := max( effort_min / t_until_deadline, project.total_effort / project.deadline);                         *Minutes per day needed*

    urgency_level: T1 | T2 | T3 | T4 | T5 | T6 | Chore

)

*From a certain point of urgence onwards multiple tasks of one project may be need to be part of one day's prompt. There is an enumeration of urgency levels to help with this:*

| level | t_per_day    | Max. per prompt |
| ----- | ------------ | --------------- |
| T6    | <30min/day   | 1               |
| T5    | 30-60min/day | 1               |
| T4    | 1-2h/day     | 2               |
| T3    | 2-4h/day     | 3               |
| T2    | 4-6h/day     | 4               |
| T1    | 6h+          | 5               |
| Chore | -            | 5               |

*Projects are groupings of tasks that overrule the urgency calculation of their subtasks IF their result is larger: the* t_per_day *and* urgency_level *are computed from project total. A 5 min task with deadline in two months is still urgent if the project has 7000 elements. A task from a project can have an earlier deadline and therefore also have higher urgency that its project still.*

Project = (id: string;

    title: string;

    deadline: Optional[Date] = None;

    elements: Task[]

    total_effort := sum( elements.effort_min)

*Again, some of the data required can't be stored because it changes by the moment and needs to be computed on call.*

    t_until_deadline := deadline - today;

    t_per_day := total_effort / t_until_deadline;

    urgency_level: T1 | T2 | T3 | T4 | T5 | T6 | Chore

)



[ ABOVE IS WHAT I NEEDED TO RUN IT UP IN PYTHON, WHAT FOLLOWS IS MUSING ABOUT WHAT COULD BE ON THE PHONE APP ]

## Notes

*Shifu needs to know his disciple: a database of notes needs to be maintained. They are the registry the LLM looks for when trying to find answers.* 

*The principle notes come from journal entries, and from the AI if it wants to write something down after something was said in chat.* 

*Then, every day, Shifu is prompted with all data of the day and tries to distill this into a daily insight note.*

*Once a week, Shifu is prompted with core data from that week to generate a weekly insights note.*

*Monthly, Shifu is prompted with summarised data from that month to generate a monthly insights note.*

*Quarterly, Shifu is prompted with essential data from the quarter to generate a quarterly insights note.*


