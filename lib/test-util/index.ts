export function should(block: () => Promise<void>) {
    return (done: any) => {
        block()
            .then(() => done())
            .catch(err => done(err));
    };
}

export async function wait(sec: number) {
    const startTime = new Date().getTime();
    await new Promise((resolve, reject) => {
        setTimeout(resolve, sec * 1000);
    });
    console.info(`Waited for ${(new Date().getTime() - startTime) / 1000.0}sec`);
}
