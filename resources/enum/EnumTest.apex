public enum EnumTest {
    One('1'),
    Two('2'),
    Three('3');

    private String id;

    private EnumTest(String id) {
        this.id = id;
    }

    public String getId() {
        return this.id;
    }
}
