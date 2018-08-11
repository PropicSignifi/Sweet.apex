public class VarargsDemo {
    private static void run(Integer num, List<String> args) {
    }
    public static void main() {
        run(10, new List<String>{ 'a', 'b' });
    }
}