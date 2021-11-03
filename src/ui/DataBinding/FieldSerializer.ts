export abstract class FieldSerializer<type> {
    abstract serialize(value: type): string
}
