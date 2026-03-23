import { BrowserRouter, Routes, Route } from "react-router-dom";
import CouncilPage from "@/components/CouncilPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CouncilPage />} />
        <Route path="*" element={<CouncilPage />} />
      </Routes>
    </BrowserRouter>
  );
}
