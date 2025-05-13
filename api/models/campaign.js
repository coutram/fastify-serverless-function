export default class Campaign {
    constructor(name, flightStart, flightEnd, description, kolType, businessCategory, productService) {
        this.name = name;
        this.flightStart = new Date(flightStart); // Ensure flightStart is a Date object
        this.flightEnd = new Date(flightEnd); // Ensure flightEnd is a Date object
        this.description = description;
        this.kolType = kolType;
        this.businessCategory = businessCategory;
        this.productService = productService;
        this.createdAt = new Date(); // Automatically set the creation date
    }

    async save() {
        const result = await this.collection.insertOne(this);
        return result.insertedId;
    }

    async getAll() {
        const result = await this.collection.find().toArray();
        return result;
    }
    
    async getById(id) {
        const result = await this.collection.findOne({ _id: id });
        return result;
    }

    async update(id, campaign) {
        const result = await this.collection.updateOne({ _id: id }, { $set: campaign });
        return result;
    }
    
    async delete(id) {
        const result = await this.collection.deleteOne({ _id: id });
        return result;
    }
       
}

