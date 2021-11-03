export abstract class FieldDeserializer<type> {
    abstract deserialize(str: string): type | null
}
