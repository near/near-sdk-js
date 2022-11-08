export declare abstract class NearEvent {
    private internal_to_json_string;
    private internal_to_json_event_string;
    /**
     * Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event.
     */
    emit(): void;
}
