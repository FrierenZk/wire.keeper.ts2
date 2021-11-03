import {ObserverField} from "./ObserverField";
import {FieldSerializer} from "./FieldSerializer";
import {FieldDeserializer} from "./FieldDeserializer";

export class ObserverInputField<type> extends ObserverField<type> {
    protected element: HTMLInputElement | null = null

    constructor(value: type, serializer: FieldSerializer<type>, deserializer: FieldDeserializer<type>) {
        super(value, serializer, deserializer)
        this.listener = ((_) => {
            if (this.element) {
                let t = this.deserializer.deserialize(String(this.element.value))
                if (t) this.data = t
                else console.warn("Element content deserialize failed")
            }
        })
    }

    static from<type>(value: type, serializer: (value: type) => string, deserializer: (str: string) => type) {
        return new ObserverInputField(value, {serialize: serializer}, {deserialize: deserializer})
    }

    static fromString(value: string) {
        return ObserverInputField.from<string>(value, (v => v), (v => v))
    }

    static fromNumber(value: number) {
        return ObserverInputField.from<number>(value, (n => n.toString()), (s) => Number(s))
    }

    setBinding(element: HTMLInputElement) {
        super.setBinding(element);
    }

    protected updateBinding() {
        if (this.element) this.element.value = this.serializer.serialize(this.data)
    }
}