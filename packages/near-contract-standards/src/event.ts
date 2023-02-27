import { near } from "near-sdk-js";

export abstract class NearEvent {

  private internal_to_json_string(): string {
    return JSON.stringify(this);
  }

  private internal_to_json_event_string(): string {
    return `EVENT_JSON: ${this.internal_to_json_string()}`;
  }

  /**
   * Logs the event to the host. This is required to ensure that the event is triggered
   * and to consume the event.
   */
  emit(): void {
    near.log(this.internal_to_json_event_string());
  }
}
