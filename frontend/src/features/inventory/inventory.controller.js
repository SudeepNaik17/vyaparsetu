import * as service from "./inventory.service";
export const load = () => service.list();
export const preview = (values) => service.submit(values);
