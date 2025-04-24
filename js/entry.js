export class Entry {
    constructor(userId, mood, note, timestamp = new Date().toISOString()) {
      this.userId = userId;
      this.mood = mood;
      this.note = note;
      this.timestamp = timestamp;
    }
  }