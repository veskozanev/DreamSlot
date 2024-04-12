import { SlotMachine } from "./classes/DreamSlot.js";

const slotMachine = new SlotMachine();
const spins = 100;
let totalWins = 0;

console.time("Execution Time");

for (let i = 0; i < spins; i++) { 
    try {
        const result = slotMachine.spin();
        totalWins += result.totalWin;
    } catch (error) {
        console.error(`Error during spin ${i}: `, error);
    }
}

console.timeEnd("Execution Time");
console.log(`Total Spins: ${spins}`);
console.log(`Total Wins: ${totalWins}`);
