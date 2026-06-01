export interface IQueueComsumer<TMessage extends Record<string, unknown>> {
  process(message: TMessage): Promise<void>;
}