import { ComprehensiveAssessmentForm } from '../../components/ComprehensiveAssessmentForm';
import { withAuth } from '../../utils/withAuth';

function NewAssessmentPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">New Vehicle Assessment</h1>
            <ComprehensiveAssessmentForm />
        </div>
    );
}

export default withAuth(NewAssessmentPage);