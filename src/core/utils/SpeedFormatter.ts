class SpeedFormatter {
    private static readonly BYTES_PER_KILOBYTE = 1024;
    private static readonly UNITS = ["B/s", "KB/s", "MB/s", "GB/s"];

    /**
     * Formats the given number of bytes into a human-readable value and unit.
     *
     * @param {number} bytes - The number of bytes to format.
     * @return {{ value: number; unit: string }} - An object containing the formatted value and unit.
     */
    static formatUnit(bytes: number): { value: number; unit: string } {
        let speed = Math.floor(bytes);
		let unitIndex = 0;

        if (speed >= this.BYTES_PER_KILOBYTE) {
            unitIndex = speed >= this.BYTES_PER_KILOBYTE ** 3 ? 3 : speed >= this.BYTES_PER_KILOBYTE ** 2 ? 2 : 1;
            speed /= this.BYTES_PER_KILOBYTE ** unitIndex;
        }

        return {
            value: Number(speed.toFixed(2)),
            unit: this.UNITS[unitIndex],
        };
    }
}

export { SpeedFormatter };
