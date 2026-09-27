import * as service from "./support.service";
export const load = () => service.list();
export const preview = (values) => service.submit(values);
