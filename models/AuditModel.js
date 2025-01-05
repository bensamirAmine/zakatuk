import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const auditTrailSchema = new Schema(
    {
      documentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      documentType: {
        type: String,
        required: true,
      },
      changes: {
        type: Schema.Types.Mixed, // You can use Mixed type for flexible structure
        required: true,
      },
    },
    {
      timestamps: true, 
    }
);

const AuditTrail = model('AuditTrail', auditTrailSchema);
export default AuditTrail;
