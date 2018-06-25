@reflect
public class ReflectDemo {
    private static String version = '1.0';
    private String name;
    private Integer count;

    public ReflectDemo() {

    }

    public String getName() {
        return this.name;
    }

    public Integer getCount() {
        return this.count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public static void test() {
        ReflectDemo demo = new ReflectDemo();
        Sweet.Reflection reflection = Sweet.reflect(demo);
    }
}
