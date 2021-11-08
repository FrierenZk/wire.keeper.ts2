import {FieldSerializer} from "./FieldSerializer";
import {FieldDeserializer} from "./FieldDeserializer";

export class ObserverField<type> {
    protected data: type
    protected element: HTMLElement | null = null
    protected serializer: FieldSerializer<type>
    protected deserializer: FieldDeserializer<type>
    protected listener: (ev: Event) => any

    constructor(value: type, serializer: FieldSerializer<type>, deserializer: FieldDeserializer<type>) {
        this.data = value
        this.serializer = serializer
        this.deserializer = deserializer
        this.listener = ((_) => {
            if (this.element) {
                let t = this.deserializer.deserialize(String(this.element.textContent))
                if (t) this.data = t
                else console.warn("Element content deserialize failed")
            }
        })
    }

    static from<type>(value: type, serializer: (value: type) => string, deserializer: (str: string) => type) {
        return new ObserverField(value, {serialize: serializer}, {deserialize: deserializer})
    }

    static fromString(value: string) {
        return ObserverField.from<string>(value, (v => v), (v => v))
    }

    static fromNumber(value: number) {
        return ObserverField.from<number>(value, (n => n.toString()), (s) => Number(s))
    }

    set(value: type) {
        this.data = value
        this.updateBinding()
    }

    get(): type {
        return this.data
    }

    setBinding(element: HTMLElement) {
        this.element?.removeEventListener('change', this.listener)
        this.element = element
        this.updateBinding()
        this.element.addEventListener('change', this.listener)
    }

    protected updateBinding() {
        if (this.element) this.element.textContent = this.serializer.serialize(this.data)
    }
}