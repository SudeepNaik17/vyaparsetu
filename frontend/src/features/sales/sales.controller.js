import * as service from "./sales.service";
export const load = () => service.list();
export const preview = (values) => service.submit(values);
