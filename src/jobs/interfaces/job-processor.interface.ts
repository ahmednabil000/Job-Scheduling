export interface JobProcessor {
  process(): Promise<void>;
}
