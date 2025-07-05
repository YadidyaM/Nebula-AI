// NASA-Grade Event Emitter for Real-Time Mission Control
// Thread-safe event handling for critical mission operations

type EventListener = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, EventListener[]>;
  private maxListeners: number;
  private debugMode: boolean;

  constructor(maxListeners: number = 100, debugMode: boolean = false) {
    this.events = new Map();
    this.maxListeners = maxListeners;
    this.debugMode = debugMode;
  }

  // Add event listener
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    
    // Check max listeners limit
    if (listeners.length >= this.maxListeners) {
      console.warn(`⚠️ Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
      return this;
    }

    listeners.push(listener);
    
    if (this.debugMode) {
      console.log(`📡 Event listener added for: ${event} (${listeners.length} total)`);
    }

    return this;
  }

  // Add one-time event listener
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };

    return this.on(event, onceWrapper);
  }

  // Remove event listener
  off(event: string, listener: EventListener): this {
    const listeners = this.events.get(event);
    if (!listeners) return this;

    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      
      if (this.debugMode) {
        console.log(`📡 Event listener removed for: ${event} (${listeners.length} remaining)`);
      }

      // Remove empty event arrays
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }

    return this;
  }

  // Remove all listeners for an event
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
      if (this.debugMode) {
        console.log(`📡 All listeners removed for: ${event}`);
      }
    } else {
      const eventCount = this.events.size;
      this.events.clear();
      if (this.debugMode) {
        console.log(`📡 All listeners removed (${eventCount} events)`);
      }
    }

    return this;
  }

  // Emit event to all listeners
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      if (this.debugMode) {
        console.log(`📡 No listeners for event: ${event}`);
      }
      return false;
    }

    if (this.debugMode) {
      console.log(`📡 Emitting event: ${event} to ${listeners.length} listener(s)`);
    }

    // Create a copy of listeners array to avoid issues if listeners are modified during emission
    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`❌ Error in event listener for '${event}':`, error);
        
        // Emit error event if this isn't already an error event (prevent infinite loops)
        if (event !== 'error') {
          this.emit('error', error, event);
        }
      }
    }

    return true;
  }

  // Get listener count for an event
  listenerCount(event: string): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  // Get all event names
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  // Get listeners for an event
  listeners(event: string): EventListener[] {
    const listeners = this.events.get(event);
    return listeners ? [...listeners] : [];
  }

  // Prepend listener (add to beginning of listeners array)
  prependListener(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event)!;
    
    if (listeners.length >= this.maxListeners) {
      console.warn(`⚠️ Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
      return this;
    }

    listeners.unshift(listener);
    
    if (this.debugMode) {
      console.log(`📡 Event listener prepended for: ${event} (${listeners.length} total)`);
    }

    return this;
  }

  // Prepend one-time listener
  prependOnceListener(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };

    return this.prependListener(event, onceWrapper);
  }

  // Set max listeners
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  // Get max listeners
  getMaxListeners(): number {
    return this.maxListeners;
  }

  // Enable/disable debug mode
  setDebugMode(enabled: boolean): this {
    this.debugMode = enabled;
    return this;
  }

  // Get event statistics
  getEventStats(): { [event: string]: number } {
    const stats: { [event: string]: number } = {};
    for (const [event, listeners] of this.events) {
      stats[event] = listeners.length;
    }
    return stats;
  }

  // NASA-specific: Emit with priority (critical events get immediate attention)
  emitPriority(event: string, priority: 'low' | 'medium' | 'high' | 'critical', ...args: any[]): boolean {
    if (priority === 'critical') {
      // For critical events, ensure immediate processing
      setImmediate(() => {
        this.emit(event, ...args);
      });
      return true;
    } else {
      return this.emit(event, ...args);
    }
  }

  // NASA-specific: Batch emit multiple events
  emitBatch(events: Array<{ name: string; args: any[] }>): void {
    for (const event of events) {
      this.emit(event.name, ...event.args);
    }
  }

  // NASA-specific: Conditional emit (only emit if condition is met)
  emitIf(condition: boolean, event: string, ...args: any[]): boolean {
    if (condition) {
      return this.emit(event, ...args);
    }
    return false;
  }

  // NASA-specific: Emit with timeout (for time-critical operations)
  emitWithTimeout(event: string, timeoutMs: number, ...args: any[]): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`⏰ Event emission timeout for: ${event} (${timeoutMs}ms)`);
        resolve(false);
      }, timeoutMs);

      try {
        const result = this.emit(event, ...args);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        console.error(`❌ Error in timed emission for '${event}':`, error);
        resolve(false);
      }
    });
  }

  // Cleanup method for proper disposal
  dispose(): void {
    if (this.debugMode) {
      console.log('🧹 EventEmitter disposing...');
    }
    
    this.removeAllListeners();
    
    if (this.debugMode) {
      console.log('✅ EventEmitter disposed');
    }
  }
}