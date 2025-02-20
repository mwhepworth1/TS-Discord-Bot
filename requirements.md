# TypeScript Features Implementation

1. **Variables with data types**
    - Example from [`src/data/user-settings.ts`](src/data/user-settings.ts):
      ```typescript
      let color: string = "0xE80231";
      ```

2. **Functions with data types**
    - Example from [`src/index.ts`](src/index.ts):
      ```typescript
      async function startCanvasAPITask() { ... }
      ```
      *(Inside, interfaces like "Assignment" enforce data types.)*

3. **Classes**
    - Example from [`src/index.ts`](src/index.ts):
      ```typescript
      const client = new Client({ ... });
      ```
      *(Using the "Client" class from discord.js.)*

4. **Arrays**
    - Example from [`src/index.ts`](src/index.ts):
      ```typescript
      upcomingResponse.data.filter(...).map(...).join('\n');
      ```
      *(Demonstrates array processing with type hints.)*

5. **Tuples**
    - Example from [`src/commands/upcoming.ts`](src/commands/upcoming.ts):
      ```typescript
      type AssignmentInfo = [string, string, string];
      const [name, date, link]: AssignmentInfo = [v[g][0], v[g][1], v[g][2]];
      ```

6. **Throwing and Handling Exceptions**
    - Example from [`src/index.ts`](src/index.ts):
      ```typescript
      try {
            // ...
      } catch (error) {
            console.error('Error in Canvas API task:', error);
      }
      ```