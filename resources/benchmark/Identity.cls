public class Identity {
    private String name;
    private Integer id;
    private Boolean active;
    private static String version = '1.0';

    public Boolean equals(Object other) {
        if(other instanceof Identity) {
            Identity target = (Identity)other;
            return this.name == target.name && this.id == target.id && this.active == target.active;
        }
        return false;
    }

    public Integer hashCode() {
        Map<String, Object> data = new Map<String, Object>();
        data.put('name', this.name);
        data.put('id', this.id);
        data.put('active', this.active);
        return Sweet.generateHashCode(data);
    }
}