import * as service from "./udhaar.service";
export const load = () => service.list();
export const preview = (values) => service.submit(values);
