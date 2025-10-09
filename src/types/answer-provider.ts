export interface IAnswerProvider {
  getLongAnswer(path: string): Promise<string | null>;
}
