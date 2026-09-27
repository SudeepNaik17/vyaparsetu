import * as service from "./customer.service";
export const load = () => service.list();
export const preview = (values) => service.submit(values);
