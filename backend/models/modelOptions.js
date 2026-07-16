const modelOptions = {
  timestamps: true,

  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
      return returnedObject;
    },
  },

  toObject: {
    virtuals: true,
    versionKey: false,
  },
};

module.exports = modelOptions;
