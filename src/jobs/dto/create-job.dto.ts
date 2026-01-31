export class CreateJobDto {
  public name: string;
  public interval: number;
  public data: Record<string, any>;
}
