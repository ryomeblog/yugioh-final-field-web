import { Routes, Route, useParams } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ComboDetailPage } from "@/pages/ComboDetailPage";
import { ComboEditPage } from "@/pages/ComboEditPage";

function ComboEditWrapper() {
  const { id } = useParams();
  return <ComboEditPage key={id ?? "new"} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/combo/new" element={<ComboEditPage key="new" />} />
      <Route path="/combo/:id" element={<ComboDetailPage />} />
      <Route path="/combo/:id/edit" element={<ComboEditWrapper />} />
    </Routes>
  );
}

export default App;
