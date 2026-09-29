import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    // State is hydrated from localStorage in a mount effect on purpose (no SSR access to it).
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
];

export default eslintConfig;
