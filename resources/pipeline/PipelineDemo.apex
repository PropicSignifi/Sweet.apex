public class PipelineDemo {
    public static void main() {
        Integer val = 1
            |> R.inc
            |> R.add.apply(1);

        val = 2 |> R.inc;
    }
}
