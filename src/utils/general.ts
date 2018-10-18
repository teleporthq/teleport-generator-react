export default class GeneralUtils {
  public static lowerFirst(inputString: string): string {
    return inputString.charAt(0).toLowerCase() + inputString.slice(1)
  }
}
