interface ExecutionTime {
  fnName: string;
  totalTime: number;
  hitCount: number;
}

const executionTimes: ExecutionTime[] = [];

async function measureExecutionTime<T>(
  fn: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T>;
function measureExecutionTime<T>(fn: (...args: any[]) => T, ...args: any[]): T;
function measureExecutionTime<T>(fn: (...args: any[]) => any, ...args: any[]): any {
  const isAsync = fn.constructor.name === 'AsyncFunction';

  const start = process.hrtime();
  const result = isAsync
    ? (fn as (...args: any[]) => Promise<T>)(...args)
    : (fn as (...args: any[]) => T)(...args);
  const end = process.hrtime(start);

  const exectionTimeMs = end[0] * 1000 + end[1] / 1000000;

  const executionTimeIndex = executionTimes.findIndex((et) => et.fnName === fn.name);

  if (executionTimeIndex === -1) {
    executionTimes.push({
      fnName: fn.name,
      totalTime: exectionTimeMs,
      hitCount: 1,
    });
  } else {
    executionTimes[executionTimeIndex].totalTime += exectionTimeMs;
    executionTimes[executionTimeIndex].hitCount++;
  }

  return isAsync ? result : (result as T);
}

function printExecutionTimes() {
  for (const et of executionTimes) {
    const avgTime = et.totalTime / et.hitCount;
    console.log(
      `Average execution time of ${et.fnName}: ${avgTime / 1000}s (total: ${et.totalTime / 1000}s)`
    );
  }
}

export { measureExecutionTime, printExecutionTimes };
