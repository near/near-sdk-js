import {near} from 'near-sdk-js'

export class NearEvent {
    internal_to_json_string(): string {
        return JSON.stringify(this)
    }

    internal_to_json_event_string(): string {
        return `EVENT_JSON: ${this.internal_to_json_string()}`
    }

    emit(): void {
        near.log(this.internal_to_json_event_string())
    }
}