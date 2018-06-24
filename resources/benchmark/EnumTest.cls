public class EnumTest extends Sweet.BaseEnum {
    public static final EnumTest One = (EnumTest)new EnumTest('1').setName('One').setOrdinal(0);
    public static final EnumTest Two = (EnumTest)new EnumTest('2').setName('Two').setOrdinal(1);
    public static final EnumTest Three = (EnumTest)new EnumTest('3').setName('Three').setOrdinal(2);

    private static final Map<String, EnumTest> instances = new Map<String, EnumTest>{ 'One' => One, 'Two' => Two, 'Three' => Three };

    public static List<EnumTest> values() {
        return instances.values();
    }

    public static EnumTest valueOf(String name) {
        return instances.get(name);
    }


    private String id;

    private EnumTest(String id) {
        this.id = id;
    }

    public String getId() {
        return this.id;
    }
}