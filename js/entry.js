export class Entry {
  constructor(userId, title, mood, feeling = [], activities = [], note, timestamp = new Date().toISOString()) {
    this.userId = userId;
    this.title = title;
    this.mood = mood;
    this.feeling = feeling;
    this.activities = activities;
    this.note = note;
    this.timestamp = timestamp;
  }
}