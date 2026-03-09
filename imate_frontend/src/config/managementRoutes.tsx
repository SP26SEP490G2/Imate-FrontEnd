import {
  Layers,
} from "lucide-react";

import Classification from "@/pages/management/Classification";

export const managementRoutes = [
  {
    label: "Quản lý hạng mục",
    icon: Layers,
    path: "classification",
    element: <Classification />,
  }
];