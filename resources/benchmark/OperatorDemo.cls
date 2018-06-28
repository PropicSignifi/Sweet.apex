public class OperatorDemo {
    public static Integer add(Integer a, Integer b) {
        return a + b;
    }
    public static void main() {
        Object a = 1;
        Object b = 2;
        System.debug((Integer)OperatorDemo.add((Integer)a, (Integer)b));
    }
}