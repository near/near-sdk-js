export declare class NearEvent {
    internal_to_json_string(): string;
    internal_to_json_event_string(): string;
    /**
     * Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event.
     */
    emit(): void;
}
