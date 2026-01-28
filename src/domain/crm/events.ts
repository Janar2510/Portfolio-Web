import { EventEmitter } from 'events';

export type CrmEventType =
    | 'PERSON_UPDATED'
    | 'ORG_UPDATED'
    | 'DEAL_UPDATED'
    | 'ACTIVITY_COMPLETED'
    | 'LEAD_CONVERTED';

export interface CrmEvent {
    type: CrmEventType;
    payload: any;
    timestamp: string;
}

class CrmEventEmitter extends EventEmitter {
    emitEvent(event: CrmEvent) {
        this.emit(event.type, event);
        this.emit('*', event); // Global listener
    }

    onEvent(type: CrmEventType | '*', callback: (event: CrmEvent) => void) {
        this.on(type, callback);
    }

    offEvent(type: CrmEventType | '*', callback: (event: CrmEvent) => void) {
        this.removeListener(type, callback);
    }
}

export const crmEvents = new CrmEventEmitter();
