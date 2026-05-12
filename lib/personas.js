// Recurring Fox Valley Tribune characters.
// Injected into the daily publish prompt so the LLM can quote or reference them naturally.

const PERSONAS = [
  {
    name: 'Mayor Patricia Dunleavy',
    role: 'Mayor of Geneva',
    personality: 'Pragmatic and measured, always has a polished quote ready. Has won four terms by being impossible to pin down ideologically. Never misses a ribbon-cutting.',
    sections: ['news', 'local-politics'],
  },
  {
    name: 'Alderman Rick Guttuso',
    role: 'Aurora City Council, Ward 4',
    personality: 'Loud, combative, and proud of it. Quotes the constitution at zoning meetings. Beloved by half the city and despised by the other half. Once filibustered a vote on parking meters for 40 minutes.',
    sections: ['local-politics', 'news'],
  },
  {
    name: 'Councilwoman Diane Solis',
    role: 'St. Charles City Council',
    personality: 'Sharp, data-driven, frequently the lone dissenting vote. Speaks in percentages and citations. Quietly running for state representative but officially denies it.',
    sections: ['local-politics', 'news'],
  },
  {
    name: 'Coach Mike Hessler',
    role: 'Batavia High School head football and wrestling coach',
    personality: 'Old-school motivator, 30 years on the sideline. Every quote sounds like a bumper sticker. Players call him "Coach H" and will run through walls for him.',
    sections: ['sports'],
  },
  {
    name: 'Coach Tanya Kowalski',
    role: 'St. Charles East girls soccer coach',
    personality: 'Young, intense, and fiercely loyal to her players. Three years in and already drawing Division I recruiting interest to the program. Doesn\'t suffer bad calls quietly.',
    sections: ['sports'],
  },
  {
    name: 'Danny Fioravanti',
    role: 'Retired Batavia athlete, now a high school referee',
    personality: 'Batavia\'s all-time leading scorer in three sports. Now refs varsity games across Kane County and tells anyone within earshot about the 2003 state championship. Harmless, hilarious, impossible to shut up.',
    sections: ['sports', 'lifestyle'],
  },
  {
    name: 'Bev Kaczmarek',
    role: 'Owner of Bev\'s Diner, Batavia',
    personality: 'Has fed every politician, coach, and gossip in Kane County for 25 years. Blunt, warm, and the unofficial clearinghouse for local rumor. Her counter is where deals get done and grudges get aired.',
    sections: ['lifestyle', 'news', 'opinion'],
  },
  {
    name: 'Walt Grudzien',
    role: 'Retired machinist, Batavia resident',
    personality: 'Cranky, lovable, and always nursing a grievance. Shows up to every city council meeting and most school board sessions. Writes a letter to the Tribune about once a month. Has been "disgusted" since 1987.',
    sections: ['opinion', 'local-politics', 'news'],
  },
  {
    name: 'Lena Przybylski',
    role: 'Tribune community columnist, "Fox Valley Life"',
    personality: 'Relentlessly optimistic community booster. Knows everyone by first name. Her column runs Thursdays and reliably generates more mail than anything else in the paper.',
    sections: ['lifestyle', 'opinion'],
  },
  {
    name: 'Coach Darnell Webb',
    role: 'Elgin High School boys basketball coach',
    personality: 'Third year at the helm, already turned a moribund program into a regional contender. Thoughtful, press-savvy, and quietly building something special on the west side of the valley.',
    sections: ['sports'],
  },
];

module.exports = { PERSONAS };
