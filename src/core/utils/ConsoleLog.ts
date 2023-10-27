
class ConsoleLog {
	private displayLog: boolean;

	constructor(displayLog: boolean = false) {
		this.displayLog = displayLog;
	}

	/**
     * Logs the message to the console if logging is enabled.
     * @param message The message to log.
     * @param logError Flag indicating whether the message is an error message.
     * @param optionalParams Optional parameters to log.
     */
	show(message?: any, isError: boolean = false, ...optionalParams: any[]) {
		if (!this.displayLog) return;

		if (isError) {
			console.error(onmessage, optionalParams);
		} else {
			console.log(message, optionalParams);
		}
	}
}

export { ConsoleLog };
