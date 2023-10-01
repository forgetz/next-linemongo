const mongoose = require('mongoose')

const linedbSchema = mongoose.Schema(
   {
      name: { 
         type: String,
         required: [true, "please enter name"]
      },
      accesstoken: {
         type: String,
         required: false,
      },
      condition: {
         type: String,
         required: false,
      },
      message: {
         type: String,
         required: false,
      },
      lastRun: {
         type: Date,
         required: false,
      },
      isActive: {
         type: Boolean,
         required: true,
      },
      isRecurring:{ 
         type: Boolean,
         required: true,
      }
   },
   {
      timestamps: true
   }
)

// const LineMongo = mongoose.model('linedb', linedbSchema);
module.exports = mongoose.models.linedb || mongoose.model('linedb', linedbSchema);