const TrainingClass = require('../models/trainingClass');

async function isRegistrationOpen(req, res, next) {
    try {
        const trainingClass = await TrainingClass.findById(req.params.id);
        if (!trainingClass) {
            return res.status(404).json({ error: "Training class not found" });
        }

        const currentDate = new Date();
        const deadlineDate = new Date(trainingClass.registrationDeadline);

        if (currentDate > deadlineDate) {
            return res.status(403).json({ error: "Registration is closed for this training class" });
        }

        // Check if the number of registered users is less than the maximum allowed
        if (trainingClass.participants.length >= trainingClass.maxRegistrations) {
            return res.status(403).json({ error: "Registration is closed for this training class, maximum registrations reached" });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = isRegistrationOpen;

//*TODO: The code below describes if current number of registered users is less than maxRegistrations
//*TODO:  If the condition is met, users can register for the training class; otherwise, registration is closed,
//*TODO: even if the 2-week time interval is still available

// const now = new Date();
// const startDate = new Date(trainingClass.startDate);
// const endDate = new Date(startDate.getTime() + 2 * 7 * 24 * 60 * 60 * 1000);

// if (now >= startDate && now <= endDate && trainingClass.users.length < trainingClass.maxRegistrations) {
//     next();
// } else {
//     return res.status(400).json({ error: 'Registration is closed for this training class' });
// }