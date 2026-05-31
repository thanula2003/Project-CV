import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home           from "./pages/Home";
import PersonalInfo   from "./pages/PersonalInfo";
import Education      from "./pages/Education";
import Experience     from "./pages/Experience";
import Skills         from "./pages/Skills";
import Summary        from "./pages/Summary";
import TemplateSelect from "./pages/TemplateSelect";
import CVView         from "./pages/CVView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/personal-info"   element={<PersonalInfo />} />
        <Route path="/education"       element={<Education />} />
        <Route path="/experience"      element={<Experience />} />
        <Route path="/skills"          element={<Skills />} />
        <Route path="/summary"         element={<Summary />} />
        <Route path="/template-select" element={<TemplateSelect />} />
        <Route path="/view"            element={<CVView />} />
      </Routes>
    </Router>
  );
}

export default App;