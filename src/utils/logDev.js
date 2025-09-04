export const logDev = (label, error) => {
    if (import.meta.env.MODE === "development") {
        console.log(label, error);
    }
};
